'use client';

import { useState, useEffect } from 'react';
import { Coach } from '@/types/coach';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter } from 'lucide-react';

interface CoachSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  className: string;
  duration: number; // in hours
}

interface CoachReport {
  coachId: number;
  coachName: string;
  totalSessions: number;
  totalHours: number;
  paymentAmount: number;
  paymentType: 'HOURLY' | 'PER_SESSION';
  rate: number;
  sessions: CoachSession[];
}

export default function CoachReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['ACADEMY_ADMIN']}>
      <CoachReportsContent />
    </ProtectedRoute>
  );
}

function CoachReportsContent() {
  const [selectedCoach, setSelectedCoach] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekNumber().toString());
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachReports, setCoachReports] = useState<CoachReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [weeks, setWeeks] = useState<{value: string, label: string}[]>([]);

  // Generate available weeks (current week and past 11 weeks)
  useEffect(() => {
    const currentWeek = getCurrentWeekNumber();
    const weekOptions = [];
    
    for (let i = 0; i < 12; i++) {
      const weekNum = currentWeek - i;
      if (weekNum > 0) {
        const weekDates = getWeekDates(new Date().getFullYear(), weekNum);
        weekOptions.push({
          value: weekNum.toString(),
          label: `Week ${weekNum} (${formatDate(weekDates.start)} - ${formatDate(weekDates.end)})`
        });
      }
    }
    
    setWeeks(weekOptions);
  }, []);

  // Fetch coaches on component mount
  useEffect(() => {
    fetchCoaches();
  }, []);

  // Fetch report data when coach or week changes
  useEffect(() => {
    if (selectedWeek) {
      fetchCoachReports();
    }
  }, [selectedCoach, selectedWeek]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coaches');
      if (!response.ok) {
        throw new Error('Failed to fetch coaches');
      }
      const data = await response.json();
      setCoaches(data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachReports = async () => {
    try {
      setLoading(true);
      // Make a real API call
      const response = await fetch(`/api/reports/coaches?week=${selectedWeek}${selectedCoach !== 'all' ? `&coachId=${selectedCoach}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        setCoachReports(data);
      } else {
        console.error('Failed to fetch coach reports');
        setCoachReports([]);
      }
    } catch (error) {
      console.error('Error fetching coach reports:', error);
      setCoachReports([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockReportData = (): CoachReport[] => {
    // This is mock data - replace with actual API response
    if (selectedCoach !== 'all') {
      const coach = coaches.find(c => c.id.toString() === selectedCoach);
      if (!coach) return [];
      
      return [{
        coachId: coach.id,
        coachName: coach.name,
        totalSessions: 5,
        totalHours: 7.5,
        paymentAmount: coach.paymentType === 'HOURLY' ? 
          coach.hourlyRate * 7.5 : 
          (coach.sessionRate || 0) * 5,
        paymentType: coach.paymentType || 'HOURLY',
        rate: coach.paymentType === 'HOURLY' ? coach.hourlyRate : (coach.sessionRate || 0),
        sessions: [
          {
            id: 1,
            date: '2023-10-15',
            startTime: '09:00',
            endTime: '10:30',
            className: 'Beginner Youth',
            duration: 1.5
          },
          {
            id: 2,
            date: '2023-10-16',
            startTime: '14:00',
            endTime: '15:30',
            className: 'Intermediate Youth',
            duration: 1.5
          },
          {
            id: 3,
            date: '2023-10-17',
            startTime: '16:00',
            endTime: '17:30',
            className: 'Advanced Youth',
            duration: 1.5
          },
          {
            id: 4,
            date: '2023-10-18',
            startTime: '10:00',
            endTime: '11:30',
            className: 'Beginner Youth',
            duration: 1.5
          },
          {
            id: 5,
            date: '2023-10-19',
            startTime: '15:00',
            endTime: '16:30',
            className: 'Weekend Warriors',
            duration: 1.5
          }
        ]
      }];
    } else {
      return coaches.map(coach => ({
        coachId: coach.id,
        coachName: coach.name,
        totalSessions: Math.floor(Math.random() * 6) + 3,
        totalHours: parseFloat((Math.random() * 8 + 4).toFixed(1)),
        paymentAmount: coach.paymentType === 'HOURLY' ? 
          coach.hourlyRate * parseFloat((Math.random() * 8 + 4).toFixed(1)) : 
          (coach.sessionRate || 0) * (Math.floor(Math.random() * 6) + 3),
        paymentType: coach.paymentType || 'HOURLY',
        rate: coach.paymentType === 'HOURLY' ? coach.hourlyRate : (coach.sessionRate || 0),
        sessions: []
      }));
    }
  };

  const exportReport = () => {
    // TODO: Implement CSV export functionality
    console.log('Exporting coach report...');
    alert('Export functionality will be implemented');
  };

  // Helper functions
  function getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 604800000;
    return Math.ceil((diff + (start.getDay() * 86400000)) / oneWeek);
  }

  function getWeekDates(year: number, weekNumber: number) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = firstDayOfYear.getDay() - 1; // Adjust for Monday as first day of week
    const firstWeekDay = new Date(year, 0, 1 + (weekNumber - 1) * 7 - daysOffset);
    const lastWeekDay = new Date(firstWeekDay);
    lastWeekDay.setDate(lastWeekDay.getDate() + 6);
    
    return {
      start: firstWeekDay,
      end: lastWeekDay
    };
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Coach Weekly Reports</h1>
          <p className="text-gray-600">Track coach sessions and calculate weekly payments</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 relative z-10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-white">
                    <SelectItem value="all">All Coaches</SelectItem>
                    {coaches.map(coach => (
                      <SelectItem key={coach.id} value={coach.id.toString()}>{coach.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent className="z-[110] bg-white">
                    {weeks.map(week => (
                      <SelectItem key={week.value} value={week.value}>{week.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={exportReport} variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Coach Reports */}
        {!loading && coachReports.length > 0 && (
          <div className="space-y-6">
            {coachReports.map(report => (
              <Card key={report.coachId} className="overflow-hidden">
                <div className="bg-blue-50 p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">{report.coachName}</h2>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Sessions</p>
                      <p className="text-lg font-medium">{report.totalSessions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Hours</p>
                      <p className="text-lg font-medium">{(report.totalHours || 0).toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rate</p>
                      <p className="text-lg font-medium">
                        ${(report.rate || 0).toFixed(2)} {report.paymentType === 'HOURLY' ? '/hour' : '/session'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Amount</p>
                      <p className="text-lg font-medium text-green-600">${(report.paymentAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Show sessions only when a specific coach is selected */}
                {selectedCoach !== 'all' && report.sessions.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {report.paymentType === 'HOURLY' ? 'Amount (Hours × Rate)' : 'Amount (Session Rate)'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.sessions.map(session => (
                          <tr key={session.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(session.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.className}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.startTime} - {session.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(session.duration || 0).toFixed(1)} hours
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${report.paymentType === 'HOURLY' 
                                ? ((session.duration || 0) * (report.rate || 0)).toFixed(2)
                                : (report.rate || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* No Data State */}
        {!loading && coachReports.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No coach data available for the selected week.</p>
          </div>
        )}
      </div>
    </div>
  );
}