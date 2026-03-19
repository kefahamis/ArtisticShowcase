import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link2,
  TrendingUp,
  Eye,
  Users
} from "lucide-react";
import AdminHeader from "@/components/admin-header";
import AdminFooter from "@/components/admin-footer";

const COLORS = {
  facebook: '#1877F2',
  twitter: '#1DA1F2', 
  linkedin: '#0A66C2',
  copy: '#6B7280'
};

export default function AdminBlogAnalytics() {
  const { data: shareStats, isLoading } = useQuery({
    queryKey: ["/api/admin/blog/shares"],
  });

  const platformIcons = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    copy: Link2
  };

  const preparePieData = () => {
    if (!shareStats?.total) return [];
    
    return [
      { name: 'Facebook', value: shareStats.total.facebook, color: COLORS.facebook },
      { name: 'Twitter', value: shareStats.total.twitter, color: COLORS.twitter },
      { name: 'LinkedIn', value: shareStats.total.linkedin, color: COLORS.linkedin },
      { name: 'Copy Link', value: shareStats.total.copy, color: COLORS.copy },
    ].filter(item => item.value > 0);
  };

  const prepareBarData = () => {
    if (!shareStats?.byPost) return [];
    
    return shareStats.byPost
      .filter((post: any) => post.total > 0)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)
      .map((post: any) => ({
        title: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
        facebook: post.facebook,
        twitter: post.twitter,
        linkedin: post.linkedin,
        copy: post.copy,
        total: post.total
      }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  const pieData = preparePieData();
  const barData = prepareBarData();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Share Analytics</h1>
            <p className="text-gray-600">Track how your blog posts are being shared across social media platforms.</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Total Shares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {shareStats?.total?.total || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">All platforms</p>
              </CardContent>
            </Card>

            {Object.entries(COLORS).map(([platform, color]) => {
              const Icon = platformIcons[platform as keyof typeof platformIcons];
              const count = shareStats?.total?.[platform] || 0;
              return (
                <Card key={platform}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {shareStats?.total?.total ? 
                        `${Math.round((count / shareStats.total.total) * 100)}% of total` : 
                        '0% of total'
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Share Distribution by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No shares recorded yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Shared Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Most Shared Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {barData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="title" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="facebook" stackId="a" fill={COLORS.facebook} />
                        <Bar dataKey="twitter" stackId="a" fill={COLORS.twitter} />
                        <Bar dataKey="linkedin" stackId="a" fill={COLORS.linkedin} />
                        <Bar dataKey="copy" stackId="a" fill={COLORS.copy} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No post shares to display</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Post List */}
          {shareStats?.byPost && shareStats.byPost.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Posts Share Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Post Title</th>
                        <th className="text-center py-3 px-4">
                          <Facebook className="w-4 h-4 mx-auto" style={{ color: COLORS.facebook }} />
                        </th>
                        <th className="text-center py-3 px-4">
                          <Twitter className="w-4 h-4 mx-auto" style={{ color: COLORS.twitter }} />
                        </th>
                        <th className="text-center py-3 px-4">
                          <Linkedin className="w-4 h-4 mx-auto" style={{ color: COLORS.linkedin }} />
                        </th>
                        <th className="text-center py-3 px-4">
                          <Link2 className="w-4 h-4 mx-auto" style={{ color: COLORS.copy }} />
                        </th>
                        <th className="text-center py-3 px-4 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shareStats.byPost
                        .sort((a: any, b: any) => b.total - a.total)
                        .map((post: any) => (
                          <tr key={post.postId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{post.title}</td>
                            <td className="text-center py-3 px-4">{post.facebook}</td>
                            <td className="text-center py-3 px-4">{post.twitter}</td>
                            <td className="text-center py-3 px-4">{post.linkedin}</td>
                            <td className="text-center py-3 px-4">{post.copy}</td>
                            <td className="text-center py-3 px-4 font-semibold">{post.total}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AdminFooter />
    </div>
  );
}