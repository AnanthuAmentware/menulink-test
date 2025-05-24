
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface QRScanChartProps {
  data: Array<{
    date: string;
    scans: number;
  }>;
}

const QRScanChart = ({ data }: QRScanChartProps) => {
  return (
    <Card className="bg-white border border-gray-200 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-black">Daily Menu Views - Last 7 Days</CardTitle>
        <CardDescription className="text-sm">Daily menu view analytics</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              fontSize={11}
              tick={{ fill: '#374151' }}
            />
            <YAxis 
              fontSize={11}
              tick={{ fill: '#374151' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="scans" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default QRScanChart;
