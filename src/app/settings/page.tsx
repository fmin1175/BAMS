'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AcademySettings {
  academyName: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  headCoach: string;
  headCoachEmail: string;
  headCoachPhone: string;
  locations: TrainingLocation[];
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  subscriptionPlan: string;
  maxStudents: number;
  maxCoaches: number;
}

interface TrainingLocation {
  id: string;
  name: string;
  address: string;
  courts: number;
  facilities: string[];
}

export default function Settings() {
  const [settings, setSettings] = useState<AcademySettings>({
    academyName: 'Elite Shuttle Badminton Academy',
    description: 'Professional badminton training academy focused on developing champions',
    email: 'info@eliteshuttle.com',
    phone: '+1 (555) 123-4567',
    website: 'www.eliteshuttle.com',
    headCoach: 'John Smith',
    headCoachEmail: 'john.smith@eliteshuttle.com',
    headCoachPhone: '+1 (555) 987-6543',
    locations: [
      {
        id: '1',
        name: 'Main Training Center',
        address: '123 Sports Complex, City Center',
        courts: 8,
        facilities: ['Air Conditioning', 'Parking', 'Changing Rooms', 'Equipment Storage']
      }
    ],
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: false }
    },
    subscriptionPlan: 'Professional',
    maxStudents: 500,
    maxCoaches: 20
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (locationId: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      locations: prev.locations.map(loc => 
        loc.id === locationId ? { ...loc, [field]: value } : loc
      )
    }));
  };

  const addLocation = () => {
    const newLocation: TrainingLocation = {
      id: Date.now().toString(),
      name: '',
      address: '',
      courts: 1,
      facilities: []
    };
    setSettings(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }));
  };

  const removeLocation = (locationId: string) => {
    setSettings(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== locationId)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '🏢' },
    { id: 'coach', name: 'Head Coach', icon: '👨‍🏫' },
    { id: 'locations', name: 'Locations', icon: '📍' },
    { id: 'hours', name: 'Operating Hours', icon: '🕐' },
    { id: 'subscription', name: 'Subscription', icon: '💳' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Elite Shuttle Logo" 
                  width={32} 
                  height={32}
                  className="mr-3"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Academy Settings</h1>
                  <p className="text-gray-600">Manage your academy configuration</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`p-4 rounded-md ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {saveMessage}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">General Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academy Name</label>
                    <input
                      type="text"
                      value={settings.academyName}
                      onChange={(e) => handleInputChange('academyName', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      value={settings.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={settings.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'coach' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Head Coach Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Head Coach Name</label>
                    <input
                      type="text"
                      value={settings.headCoach}
                      onChange={(e) => handleInputChange('headCoach', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Head Coach Email</label>
                    <input
                      type="email"
                      value={settings.headCoachEmail}
                      onChange={(e) => handleInputChange('headCoachEmail', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Head Coach Phone</label>
                    <input
                      type="tel"
                      value={settings.headCoachPhone}
                      onChange={(e) => handleInputChange('headCoachPhone', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Training Locations</h3>
                  <button
                    onClick={addLocation}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Location
                  </button>
                </div>
                {settings.locations.map((location, index) => (
                  <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Location {index + 1}</h4>
                      {settings.locations.length > 1 && (
                        <button
                          onClick={() => removeLocation(location.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location Name</label>
                        <input
                          type="text"
                          value={location.name}
                          onChange={(e) => handleLocationChange(location.id, 'name', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Courts</label>
                        <input
                          type="number"
                          min="1"
                          value={location.courts}
                          onChange={(e) => handleLocationChange(location.id, 'courts', parseInt(e.target.value))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        rows={2}
                        value={location.address}
                        onChange={(e) => handleLocationChange(location.id, 'address', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Current Plan: {settings.subscriptionPlan}</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Max Students: {settings.maxStudents}</p>
                        <p>Max Coaches: {settings.maxCoaches}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Upgrade Plan
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
                    View Billing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}