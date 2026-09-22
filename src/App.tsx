import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SchedulesView } from './components/SchedulesView';
import { TargetsView } from './components/TargetsView';
import { StreamersView } from './components/StreamersView';
import { ProductsView } from './components/ProductsView';
import { ComparisonView } from './components/ComparisonView';
import { VoucherCountdownTimer } from './components/VoucherCountdownTimer';
import { ReportInputModal } from './components/ReportInputModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import { ResetDataModal } from './components/ResetDataModal';
import { dataService } from './services/dataService';
import { 
  LiveSession, 
  Streamer, 
  Shift, 
  Schedule, 
  KPITarget, 
  ProductCatalog, 
  UserRole 
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');

  // Application Data States
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [targets, setTargets] = useState<KPITarget[]>([]);
  const [products, setProducts] = useState<ProductCatalog[]>([]);

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalInitialData, setReportModalInitialData] = useState<Partial<LiveSession> | undefined>(undefined);
  const [selectedDetailSession, setSelectedDetailSession] = useState<LiveSession | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Subscribe to real-time data & fallback storage
  useEffect(() => {
    const unsubSessions = dataService.subscribeSessions(setSessions);
    const unsubStreamers = dataService.subscribeStreamers(setStreamers);
    const unsubShifts = dataService.subscribeShifts(setShifts);
    const unsubSchedules = dataService.subscribeSchedules(setSchedules);
    const unsubTargets = dataService.subscribeTargets(setTargets);
    const unsubProducts = dataService.subscribeProducts(setProducts);

    return () => {
      unsubSessions();
      unsubStreamers();
      unsubShifts();
      unsubSchedules();
      unsubTargets();
      unsubProducts();
    };
  }, []);

  // Open direct report modal when tab changes to input-report
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'input-report') {
      setReportModalInitialData(undefined);
      setIsReportModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Save live session
  const handleSaveSession = async (session: LiveSession) => {
    await dataService.saveSession(session);

    // If linked to a schedule on same date & shift, mark schedule as reported
    const matchedSchedule = schedules.find(
      s => s.date === session.businessDate && s.shiftId === session.shiftId && s.streamerId === session.streamerId
    );
    if (matchedSchedule) {
      await dataService.saveSchedule({
        ...matchedSchedule,
        hasReport: true,
        reportId: session.id,
        status: 'Completed',
      });
    }
  };

  // Schedule report trigger
  const handleFillReportForSchedule = (schedule: Schedule) => {
    setReportModalInitialData({
      streamerId: schedule.streamerId,
      businessDate: schedule.date,
      shiftId: schedule.shiftId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      notes: schedule.notes ? `Sesuai briefing jadwal: ${schedule.notes}` : '',
    });
    setIsReportModalOpen(true);
  };

  // Schedule CRUD
  const handleSaveSchedule = async (schedule: Schedule) => {
    await dataService.saveSchedule(schedule);
  };

  const handleDeleteSchedule = async (id: string) => {
    await dataService.deleteSchedule(id);
  };

  // Target CRUD
  const handleSaveTarget = async (target: KPITarget) => {
    await dataService.saveTarget(target);
  };

  const handleDeleteTarget = async (id: string) => {
    await dataService.deleteTarget(id);
  };

  // Streamer CRUD
  const handleSaveStreamer = async (streamer: Streamer) => {
    await dataService.saveStreamer(streamer);
  };

  const handleDeleteStreamer = async (id: string) => {
    await dataService.deleteStreamer(id);
  };

  // Reset to clean slate or restore demo data
  const handleResetToEmpty = async (options: {
    clearSessions: boolean;
    clearSchedules: boolean;
    clearTargets: boolean;
    clearStreamers: boolean;
    clearProducts: boolean;
  }) => {
    await dataService.resetToEmptyData(options);
    if (options.clearSessions) setSessions([]);
    if (options.clearSchedules) setSchedules([]);
    if (options.clearTargets) setTargets([]);
    if (options.clearStreamers) setStreamers([]);
    if (options.clearProducts) setProducts([]);
  };

  const handleRestoreDemo = async () => {
    await dataService.restoreDemoData();
    const [sess, str, sch, tar, prod] = await Promise.all([
      dataService.getLiveSessions(),
      dataService.getStreamers(),
      dataService.getSchedules(),
      dataService.getTargets(),
      dataService.getProducts(),
    ]);
    setSessions(sess);
    setStreamers(str);
    setSchedules(sch);
    setTargets(tar);
    setProducts(prod);
  };

  // Pending reports count
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingReportsCount = schedules.filter(s => s.date <= todayStr && !s.hasReport).length;

  // Month revenue sum for sidebar
  const currentMonth = todayStr.substring(0, 7);
  const totalMonthRevenue = sessions
    .filter(s => s.businessDate.startsWith(currentMonth))
    .reduce((acc, s) => acc + (s.revenue || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenReportModal={() => {
          setReportModalInitialData(undefined);
          setIsReportModalOpen(true);
        }}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        pendingReportsCount={pendingReportsCount}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentRole={currentRole}
          pendingReportsCount={pendingReportsCount}
          totalMonthRevenue={totalMonthRevenue}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              sessions={sessions}
              streamers={streamers}
              shifts={shifts}
              currentRole={currentRole}
              onOpenReportModal={() => {
                setReportModalInitialData(undefined);
                setIsReportModalOpen(true);
              }}
              onViewSessionDetail={setSelectedDetailSession}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}

          {activeTab === 'schedules' && (
            <SchedulesView
              schedules={schedules}
              streamers={streamers}
              shifts={shifts}
              currentRole={currentRole}
              onSaveSchedule={handleSaveSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onFillReportForSchedule={handleFillReportForSchedule}
            />
          )}

          {activeTab === 'targets' && (
            <TargetsView
              targets={targets}
              sessions={sessions}
              streamers={streamers}
              currentRole={currentRole}
              onSaveTarget={handleSaveTarget}
              onDeleteTarget={handleDeleteTarget}
            />
          )}

          {activeTab === 'streamers' && (
            <StreamersView
              streamers={streamers}
              sessions={sessions}
              currentRole={currentRole}
              onSaveStreamer={handleSaveStreamer}
              onDeleteStreamer={handleDeleteStreamer}
              initialSubTab="list"
              onSubTabChange={(tab) => {
                if (tab === 'top-performers') setActiveTab('top-performers');
              }}
            />
          )}

          {activeTab === 'top-performers' && (
            <StreamersView
              streamers={streamers}
              sessions={sessions}
              currentRole={currentRole}
              onSaveStreamer={handleSaveStreamer}
              onDeleteStreamer={handleDeleteStreamer}
              initialSubTab="top-performers"
              onSubTabChange={(tab) => {
                if (tab === 'list') setActiveTab('streamers');
              }}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonView
              sessions={sessions}
              streamers={streamers}
              shifts={shifts}
            />
          )}

          {activeTab === 'voucher-timer' && (
            <VoucherCountdownTimer />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              sessions={sessions}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ReportInputModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSave={handleSaveSession}
        streamers={streamers}
        shifts={shifts}
        products={products}
        initialData={reportModalInitialData}
      />

      <SessionDetailModal
        isOpen={!!selectedDetailSession}
        session={selectedDetailSession}
        onClose={() => setSelectedDetailSession(null)}
      />

      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        sessions={sessions}
        streamers={streamers}
        schedules={schedules}
        targets={targets}
        onResetToEmpty={handleResetToEmpty}
        onRestoreDemo={handleRestoreDemo}
      />
    </div>
  );
}
