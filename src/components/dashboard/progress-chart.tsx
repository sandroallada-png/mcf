
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Meal } from '@/lib/types';
import React from 'react';

const chartConfig = {
  calories: {
    label: 'Calories',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface ProgressChartProps {
  meals?: Omit<Meal, 'id' | 'date'>[];
}

export function ProgressChart({ meals = [] }: ProgressChartProps) {
  const chartData = React.useMemo(() => {
    const data = [
      { type: 'Petit-déj.', calories: 0 },
      { type: 'Déjeuner', calories: 0 },
      { type: 'Dîner', calories: 0 },
      { type: 'Desserts', calories: 0 },
    ];

    if (!meals) {
        return data;
    }

    for (const meal of meals) {
      let item;
      switch (meal.type) {
        case 'breakfast':
          item = data.find(d => d.type === 'Petit-déj.');
          break;
        case 'lunch':
          item = data.find(d => d.type === 'Déjeuner');
          break;
        case 'dinner':
          item = data.find(d => d.type === 'Dîner');
          break;
        case 'dessert':
          item = data.find(d => d.type === 'Desserts');
          break;
      }
      if (item) {
        item.calories += meal.calories;
      }
    }
    return data;
  }, [meals]);

  const totalCalories = React.useMemo(() => {
    if (!meals) {
        return 0;
    }
    return meals.reduce((acc, meal) => acc + meal.calories, 0);
  }, [meals]);

  return (
    <div className="relative h-80 w-full">
      <div className="absolute top-6 right-6 text-right">
        <p className="text-sm text-muted-foreground">Total Aujourd'hui</p>
        <p className="text-3xl font-bold text-primary">
          {totalCalories}{' '}
          <span className="text-base font-normal text-muted-foreground">
            kcal
          </span>
        </p>
      </div>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 40, right: 30, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Bar dataKey="calories" fill="hsl(var(--primary))" radius={8} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
