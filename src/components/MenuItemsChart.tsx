
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MenuItemsChartProps {
  data: Array<{
    name: string;
    items: number;
  }>;
}

const MenuItemsChart = ({ data }: MenuItemsChartProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Menu Items by Section</CardTitle>
        <CardDescription>Number of items in each menu section</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(139, 38, 53, 0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Bar 
              dataKey="items" 
              fill="#8B2635" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MenuItemsChart;
