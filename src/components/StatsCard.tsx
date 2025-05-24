
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

const StatsCard = ({ title, value, description, icon: Icon, trend, isLoading }: StatsCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow bg-white border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
            {description && <div className="h-3 bg-gray-200 rounded w-24"></div>}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className={`text-xs mt-1 flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span>{trend.isPositive ? '+' : ''}{trend.value}% from last month</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
