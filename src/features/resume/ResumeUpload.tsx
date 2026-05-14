import { useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useDashboardStore, dashboardActions } from "@/store/dashboardStore";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseResumeFile, validateResumeFile, formatFileSize } from "@/services/resumeParser";
import { calculateATSScore } from "@/services/atsService";
import { ProfileService } from "@/services/profileService";
import { SupabaseService } from "@/services/supabaseService";
import { analytics } from "@/lib/analytics";

export function ResumeUpload() {
  const { user } = useUser();
  const store = useDashboardStore();
  const { dispatch } = store;
  const state = store;
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!user?.id) return;

    setError(null);
    setProgress(0);

    try {
      // Validate file
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      setUploading(true);
      setProgress(20);

      // Upload to Supabase Storage (if available) or use local approach
      let filePath = '';
      if (SupabaseService.isAvailable()) {
        const fileName = `resumes/${user.id}/${Date.now()}_${file.name}`;
        const uploadResult = await SupabaseService.uploadFile('resumes', fileName, file);
        
        if (uploadResult.error) {
          throw new Error(uploadResult.error);
        }
        
        filePath = uploadResult.path;
        setProgress(50);
      } else {
        // Fallback: store file info locally
        filePath = `local_${file.name}`;
        setProgress(50);
      }

      // Parse resume
      setParsing(true);
      setProgress(60);

      const parseResult = await parseResumeFile(file);
      if (!parseResult.success || !parseResult.data) {
        throw new Error(parseResult.error || 'Failed to parse resume');
      }

      setProgress(80);

      // Calculate ATS score
      const atsResult = calculateATSScore(
        parseResult.data,
        state.onboarding
      );

      // Create resume object
      const resumeData = {
        uploaded: true,
        fileName: file.name,
        fileSize: file.size,
        filePath,
        uploadedAt: new Date().toISOString(),
        extractedText: parseResult.data.rawText,
        parsedData: parseResult.data,
        atsScore: atsResult.score,
        feedback: atsResult.feedback,
      };

      // Save to database
      if (SupabaseService.isAvailable()) {
        await SupabaseService.uploadResume(user.id, resumeData);
      } else {
        await ProfileService.saveResume(user.id, resumeData);
      }

      // Update centralized dashboard state
      const centralizedResumeData = {
        uploaded: true,
        fileName: file.name,
        fileSize: file.size,
        filePath,
        uploadedAt: new Date().toISOString(),
        extractedText: parseResult.data.rawText,
        parsedData: parseResult.data,
        atsScore: atsResult.score,
        feedback: atsResult.feedback,
      };
      
      // Single centralized update - NO duplicate ATS state
      dispatch(dashboardActions.setResume(centralizedResumeData));

      setProgress(100);

      // Track analytics
      analytics.track('resume_uploaded', {
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        atsScore: atsResult.score,
      });

      // Clear upload state after delay
      setTimeout(() => {
        setUploading(false);
        setParsing(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Resume upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload resume');
      setUploading(false);
      setParsing(false);
      setProgress(0);
    }
  }, [user?.id, state.onboarding, dispatch]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDeleteResume = async () => {
    if (!user?.id) return;

    try {
      // Delete from storage
      if (state.resume.filePath && SupabaseService.isAvailable()) {
        await SupabaseService.deleteFile('resumes', state.resume.filePath);
      }

      // Delete from database
      if (SupabaseService.isAvailable()) {
        await SupabaseService.deleteResume(user.id);
      } else {
        await ProfileService.deleteResume(user.id);
      }

      // Update state
      dispatch(dashboardActions.setResume({ uploaded: false }));

      // Track analytics
      analytics.track('resume_deleted', {
        userId: user.id,
      });

    } catch (error) {
      console.error('Resume delete error:', error);
      setError('Failed to delete resume');
    }
  };

  if (state.resume.uploaded) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Resume Uploaded
              </CardTitle>
              <CardDescription>
                {state.resume.fileName} • {formatFileSize(state.resume.fileSize || 0)}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDeleteResume}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ATS Score */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{state.resume.atsScore || 0}/100</div>
              <div className="text-sm text-gray-600">ATS Score</div>
            </div>
            <Badge 
              variant={state.resume.atsScore! >= 80 ? 'default' : 'secondary'}
              className={state.resume.atsScore! >= 80 ? 'bg-green-100 text-green-800' : ''}
            >
              {state.resume.atsScore! >= 80 ? 'Excellent' : 
               state.resume.atsScore! >= 60 ? 'Good' :
               state.resume.atsScore! >= 40 ? 'Fair' : 'Poor'}
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress value={state.resume.atsScore || 0} className="h-2" />

          {/* Feedback Summary */}
          {state.resume.feedback && state.resume.feedback.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Key Feedback</h4>
              <div className="space-y-1">
                {state.resume.feedback
                  .filter((f: any) => f.type === 'recommendation')
                  .slice(0, 3)
                  .map((feedback: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{feedback.message}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Update Resume
            </Button>
            <Button className="flex-1">
              View Full Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Resume
        </CardTitle>
        <CardDescription>
          Upload your resume to get ATS scoring and personalized job recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            uploading ? 'pointer-events-none opacity-50 border-gray-300' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <div>
                <div className="font-medium">
                  {parsing ? 'Analyzing Resume...' : 'Uploading...'}
                </div>
                <div className="text-sm text-gray-600">
                  {parsing ? 'Extracting skills and experience' : 'Uploading file'}
                </div>
              </div>
              <Progress value={progress} className="w-full max-w-xs mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <div className="font-medium">
                  Drag and drop your resume here
                </div>
                <div className="text-sm text-gray-600">
                  or click to browse files
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Resume Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a clean, simple format without tables or columns</li>
            <li>• Include measurable achievements with numbers and percentages</li>
            <li>• Add relevant keywords from your target job descriptions</li>
            <li>• Keep it to 1-2 pages for most experience levels</li>
            <li>• Save as PDF for best ATS compatibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
