"use client";

import { TrendingUp, Users, MousePointer2, Layers } from "lucide-react";
import { motion } from "framer-motion";

export function StatsCards() {
  const stats = [
    { 
      label: "전체 방문자", 
      value: "12,543", 
      change: "+12%", 
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    { 
      label: "전체 클릭", 
      value: "1,829", 
      change: "+5.4%", 
      icon: MousePointer2,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    { 
      label: "활성 포트폴리오", 
      value: "5", 
      change: "0%", 
      icon: Layers,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white border border-gray-100 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-gray-200 transition-all duration-300 group cursor-default"
        >
          <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            {stat.change !== "0%" && (
              <div className="flex items-center gap-1 text-[13px] font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            )}
          </div>
          <div>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="text-3xl font-black text-gray-900 tracking-tight mb-2"
            >
              {stat.value}
            </motion.div>
            <div className="text-[15px] font-semibold text-gray-400">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
