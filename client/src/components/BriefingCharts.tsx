import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BriefingChartsProps {
  data: {
    marketGrowth?: Array<{ year: string; value: number }>;
    competitorComparison?: Array<{ name: string; marketShare: number }>;
    trendAnalysis?: Array<{ month: string; trend: number }>;
  };
}

const COLORS = ['#000000', '#404040', '#808080', '#B0B0B0', '#D0D0D0'];

export function BriefingCharts({ data }: BriefingChartsProps) {
  return (
    <div className="space-y-6">
      {data.marketGrowth && data.marketGrowth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Marktwachstum</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.marketGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#000" 
                  strokeWidth={2}
                  name="Wachstum (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.competitorComparison && data.competitorComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wettbewerbsvergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.competitorComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar 
                  dataKey="marketShare" 
                  fill="#000" 
                  name="Marktanteil (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.trendAnalysis && data.trendAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trend-Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trendAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  stroke="#000" 
                  strokeWidth={2}
                  name="Trend-Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
