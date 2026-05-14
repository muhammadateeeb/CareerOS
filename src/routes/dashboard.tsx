import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useDashboardStore, dashboardActions } from "@/store/dashboardStore";
import { analytics } from "@/lib/analytics";
import { 
  ArrowUpRight, 
  Bell, 
  Briefcase, 
  CheckCircle2, 
  ChevronDown, 
  DollarSign,
  FileText, 
  Gauge, 
  LayoutDashboard, 
  Linkedin, 
  LogOut, 
  Menu, 
  Search, 
  Settings, 
  Target, 
  TrendingUp, 
  User, 
  Calendar,
  Upload,
  AlertCircle,
  Plus,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { ProfileService } from "@/services/profileService";
import { findMatchingJobs, generateJobRecommendations } from "@/services/jobMatcher";
import { calculateATSScore, getATSCategory, getATSCategoryColor } from "@/lib/resume/atsEngine";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "CareerOS Dashboard | AI Job Success System" },
      { name: "description", content: "Your personalized dashboard for job search success with AI-powered recommendations." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const store = useDashboardStore();
  const { dispatch } = store;
  const state = store;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        dispatch(dashboardActions.setLoading(true));
        
        try {
          // Load profile data
          const profileData = await ProfileService.getUserProfile(user.id);
          if (profileData) {
            dispatch(dashboardActions.setUser(profileData.user));
            if (profileData.onboarding) {
              dispatch(dashboardActions.setOnboarding(profileData.onboarding));
            }
            if (profileData.resume) {
              dispatch(dashboardActions.setResume(profileData.resume));
            }
            if (profileData.applications) {
              dispatch(dashboardActions.setApplications(profileData.applications));
            }
          }
          
          // Load matched jobs
          if (profileData?.onboarding) {
            const jobMatches = findMatchingJobs(
              profileData.onboarding,
              profileData.resume?.parsedData || null
            );
            dispatch(dashboardActions.setJobs(jobMatches.jobs));
          }
          
          // Track dashboard visit
          analytics.track('dashboard_visit', {
            userId: user.id,
            hasOnboarding: !!profileData?.onboarding?.completed,
            hasResume: !!profileData?.resume?.uploaded,
          });
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          dispatch(dashboardActions.setError('Failed to load dashboard data'));
        } finally {
          dispatch(dashboardActions.setLoading(false));
        }
      }
    };
    
    loadUserData();
  }, [user?.id, dispatch]);

  // Redirect if not authenticated
  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  // Redirect to onboarding if not completed
  if (!state.onboarding?.completed) {
    navigate({ to: "/onboarding" });
    return null;
  }

  const handleLogout = () => {
    analytics.track('logout', { userId: user.id });
    dispatch(dashboardActions.clearUser());
    navigate({ to: "/" });
  };

  // Compute real-time analytics from store state
  const profileStrength = store.getProfileStrength();
  const completionPercentage = store.getCompletionPercentage();
  const applicationsCount = state.applications.length;
  const interviewsCount = state.applications.filter(app => app.status === 'interview').length;
  const avgMatchScore = state.jobs.length > 0
    ? Math.round(state.jobs.reduce((sum, job) => sum + (job.matchPercentage || 0), 0) / state.jobs.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${!sidebarOpen && 'justify-center'}`}>
              <Briefcase className="w-8 h-8 text-blue-600" />
              {sidebarOpen && <span className="font-bold text-xl">CareerOS</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: FileText, label: "Resume Lab", href: "/resume-lab" },
            { icon: Target, label: "Job Matches" },
            { icon: Briefcase, label: "Applications" },
            { icon: Calendar, label: "Interview Prep" },
            { icon: TrendingUp, label: "Analytics" },
            { icon: Settings, label: "Settings" },
          ].map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start ${item.active ? "bg-blue-600 text-white" : ""}`}
              onClick={() => item.href && navigate({ to: item.href })}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {sidebarOpen && item.label}
            </Button>
          ))}
        </nav>

        {/* User Profile */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="w-6 h-6 mr-3">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{user.emailAddresses[0]?.emailAddress}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SignOutButton>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-96"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              {!sidebarOpen && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <SignOutButton>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </SignOutButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {state.isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          ) : state.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {state.error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-2">
                  Welcome back, {user.firstName}! 👋
                </h1>
                <p className="text-blue-100 mb-4">
                  Target Role: {state.onboarding?.targetRole} • {state.onboarding?.industry}
                </p>
                <div className="flex items-center space-x-6">
                  <div>
                    <div className="text-3xl font-bold">{completionPercentage}%</div>
                    <div className="text-blue-100 text-sm">Profile Complete</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{applicationsCount}</div>
                    <div className="text-blue-100 text-sm">Applications</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{interviewsCount}</div>
                    <div className="text-blue-100 text-sm">Interviews</div>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Applications</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{applicationsCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {applicationsCount > 0 ? 'Keep up the great work!' : 'Start applying to jobs'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{interviewsCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {interviewsCount > 0 ? `${interviewsCount} scheduled` : 'No interviews yet'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getATSCategoryColor(state.resume.atsScore || 0)}`}>
                      {state.resume.atsScore || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {state.resume.atsScore ? getATSCategory(state.resume.atsScore) : 'No resume uploaded'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profileStrength}%</div>
                    <Progress value={profileStrength} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="resume">Resume Health</TabsTrigger>
                  <TabsTrigger value="jobs">Job Matches</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest job search activities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {state.applications.length > 0 ? (
                          <div className="space-y-3">
                            {state.applications.slice(0, 3).map((app) => (
                              <div key={app.id} className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{app.jobTitle}</div>
                                  <div className="text-sm text-gray-500">{app.company}</div>
                                </div>
                                <Badge variant={getStatusVariant(app.status)}>
                                  {app.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No applications yet</p>
                            <Button 
                              className="mt-4" 
                              onClick={() => navigate({ to: "/resume-lab" })}
                            >
                              Start Applying
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Weekly Goals */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Weekly Goals</CardTitle>
                        <CardDescription>Recommended activities for this week</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {generateWeeklyGoals(state).map((goal, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                              }`}>
                                {goal.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`text-sm ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                                {goal.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="resume" className="space-y-4">
                  <ResumeHealthSection resume={state.resume} onboarding={state.onboarding} />
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4">
                  <JobMatchesSection jobs={state.jobs} />
                </TabsContent>

                <TabsContent value="applications" className="space-y-4">
                  <ApplicationsSection applications={state.applications} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Helper Components
function ResumeHealthSection({ resume, onboarding }: { resume: any; onboarding: any }) {
  if (!resume.uploaded) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Resume Uploaded</h3>
          <p className="text-gray-600 mb-6">Upload your resume to get ATS scoring and personalized feedback</p>
          <Button onClick={() => window.location.href = '/resume-lab'}>
            Upload Resume
          </Button>
        </CardContent>
      </Card>
    );
  }

  const score = resume.atsScore || 0;
  const category = getATSCategory(score);
  const categoryColor = getATSCategoryColor(score);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            ATS Score
            <Badge className={categoryColor}>{category}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold mb-4 ${categoryColor}`}>
            {score}/100
          </div>
          <Progress value={score} className="mb-4" />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Keyword Match</span>
              <span>Good</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Skills Alignment</span>
              <span>Excellent</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Formatting</span>
              <span>Needs Work</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resume.feedback?.filter((f: any) => f.type === 'recommendation').slice(0, 4).map((feedback: any, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span className="text-sm">{feedback.message}</span>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" variant="outline">
            View Full Report
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function JobMatchesSection({ jobs }: { jobs: any[] }) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Job Matches Yet</h3>
          <p className="text-gray-600 mb-6">Complete your profile to get personalized job recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Job Matches ({jobs.length})</h3>
        <Button variant="outline">
          View All
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.slice(0, 6).map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                <Badge variant={job.matchPercentage! >= 80 ? 'default' : 'secondary'}>
                  {job.matchPercentage}% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {job.salary.min && job.salary.max 
                    ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                    : 'Salary not specified'
                  }
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ApplicationsSection({ applications }: { applications: any[] }) {
  const statusCounts = applications.reduce((counts, app) => {
    counts[app.status] = (counts[app.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['saved', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
          <Card key={status}>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold">{statusCounts[status] || 0}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{app.jobTitle}</div>
                    <div className="text-sm text-gray-500">{app.company} • {app.location}</div>
                  </div>
                  <Badge variant={getStatusVariant(app.status)}>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Utility Functions
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'offer': return 'default';
    case 'interview': return 'secondary';
    case 'applied': return 'outline';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
}

function generateWeeklyGoals(state: any) {
  const goals = [];
  
  // Goal 1: Application target
  const weeklyApps = state.analytics?.weeklyActivity?.applications || 0;
  goals.push({ 
    text: `Apply to 5 jobs this week (${weeklyApps}/5)`, 
    completed: weeklyApps >= 5 
  });
  
  // Goal 2: ATS score improvement
  const atsScore = state.resume?.atsScore || 0;
  if (atsScore < 80) {
    goals.push({ 
      text: `Improve ATS score to 80+ (currently ${atsScore})`, 
      completed: atsScore >= 80 
    });
  } else {
    goals.push({ 
      text: `Maintain excellent ATS score (${atsScore}/100)`, 
      completed: true 
    });
  }
  
  // Goal 3: LinkedIn profile
  const hasLinkedIn = !!(state.onboarding?.linkedinUrl || state.resume?.parsedData?.personalInfo?.linkedin);
  goals.push({ 
    text: 'Add LinkedIn profile to resume', 
    completed: hasLinkedIn 
  });
  
  // Goal 4: Skills target
  const skillCount = state.resume?.parsedData?.skills?.length || state.onboarding?.skills?.length || 0;
  if (skillCount < 8) {
    goals.push({ 
      text: `Add more skills to resume (${skillCount}/8)`, 
      completed: skillCount >= 8 
    });
  } else {
    goals.push({ 
      text: `Strong skill set (${skillCount} skills listed)`, 
      completed: true 
    });
  }
  
  return goals;
}
