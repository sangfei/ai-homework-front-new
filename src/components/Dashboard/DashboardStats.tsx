import React from 'react';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${color}`}>{change}</p>
        </div>
        <div className={`p-3 rounded-lg ${color === 'text-green-600' ? 'bg-green-50' : 'bg-blue-50'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: '总学生数',
      value: '1,234',
      change: '+12% 较上月',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: 'text-green-600'
    },
    {
      title: '作业完成率',
      value: '86.7%',
      change: '+2.3% 较上周',
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      color: 'text-green-600'
    },
    {
      title: '平均分',
      value: '78.3',
      change: '+1.2 较上月',
      icon: <Award className="w-6 h-6 text-blue-600" />,
      color: 'text-green-600'
    },
    {
      title: '活跃教师',
      value: '92',
      change: '+5 较上月',
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;