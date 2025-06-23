// src/components/Dashboard/AnnouncementsCard.tsx

'use client'

import React, { useState } from 'react'
import {
  Bell,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react'
import { useAnnouncements } from '@/hooks/announcements'
import { formatDateOnly } from '@/utils/dateConverter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Announcement } from '@/types/Announcements'

const AnnouncementsCard = () => {
  const {
    sortedAnnouncements,
    urgentAnnouncements,
    announcementSummary,
    isLoading,
    isError,
    getPreviewContent,
    getImportanceConfig,
    isExpiringSoon,
    isExpired,
    mutate,
  } = useAnnouncements()

  const [searchTerm, setSearchTerm] = useState('')
  const [importanceFilter, setImportanceFilter] = useState<string>('all')
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<
    Set<number>
  >(new Set())
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  // Filter announcements based on search and filter criteria
  const filteredAnnouncements = sortedAnnouncements.filter(announcement => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesImportance =
      importanceFilter === 'all' ||
      announcement.importance_level.toString() === importanceFilter

    return matchesSearch && matchesImportance
  })

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedAnnouncements)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedAnnouncements(newExpanded)
  }

  const getExpirationBadge = (announcement: Announcement) => {
    if (isExpired(announcement)) {
      return (
        <Badge variant="destructive" className="text-xs">
          Expired
        </Badge>
      )
    } else if (isExpiringSoon(announcement)) {
      return (
        <Badge
          variant="outline"
          className="text-xs border-orange-500 text-orange-700">
          {announcement.days_remaining} day
          {announcement.days_remaining !== 1 ? 's' : ''} left
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="text-xs">
          {announcement.expires_at_human}
        </Badge>
      )
    }
  }

  const getImportanceBadge = (announcement: Announcement) => {
    const config = getImportanceConfig(announcement.importance_level)
    return (
      <Badge
        variant="outline"
        className={`text-xs ${config.bgColor} ${config.textColor} border-transparent`}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="col-span-2 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Pengumuman</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading announcements...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="col-span-2 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Pengumuman</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Alert className="w-full">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Error loading announcements.{' '}
              <button
                onClick={() => mutate()}
                className="text-blue-600 hover:text-blue-800 underline">
                Retry
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="col-span-2 bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Bell className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Pengumuman</h3>
          {announcementSummary.total > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              {announcementSummary.active} active
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-1" />
                Summary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Announcements Summary</DialogTitle>
                <DialogDescription>
                  Overview of all announcements for your department
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {announcementSummary.total}
                    </div>
                    <div className="text-sm text-blue-800">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {announcementSummary.active}
                    </div>
                    <div className="text-sm text-green-800">Active</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">By Importance:</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        High Priority
                      </span>
                      <span>{announcementSummary.byImportance.high}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Medium Priority
                      </span>
                      <span>{announcementSummary.byImportance.medium}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Low Priority
                      </span>
                      <span>{announcementSummary.byImportance.low}</span>
                    </div>
                  </div>
                </div>

                {urgentAnnouncements.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {urgentAnnouncements.length} announcement
                      {urgentAnnouncements.length !== 1 ? 's' : ''} expiring
                      soon!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Urgent Announcements Alert */}
      {urgentAnnouncements.length > 0 && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <span className="font-medium">
              {urgentAnnouncements.length} urgent announcement
              {urgentAnnouncements.length !== 1 ? 's' : ''}
            </span>{' '}
            expiring soon!
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      {sortedAnnouncements.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={importanceFilter} onValueChange={setImportanceFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="3">🚨 High Priority</SelectItem>
              <SelectItem value="2">⚠️ Medium Priority</SelectItem>
              <SelectItem value="1">📋 Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map(announcement => (
            <Collapsible
              key={announcement.id}
              open={expandedAnnouncements.has(announcement.id)}
              onOpenChange={() => toggleExpanded(announcement.id)}>
              <div
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isExpiringSoon(announcement)
                    ? 'border-orange-300 bg-orange-50'
                    : isExpired(announcement)
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4
                        className={`font-medium pr-2 ${
                          isExpired(announcement)
                            ? 'text-gray-500'
                            : 'text-gray-800'
                        }`}>
                        {announcement.title}
                      </h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getImportanceBadge(announcement)}
                        {expandedAnnouncements.has(announcement.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    <p
                      className={`text-sm mb-3 ${
                        isExpired(announcement)
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}>
                      {getPreviewContent(announcement.content, 120)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {getExpirationBadge(announcement)}

                      {announcement.departments.slice(0, 2).map(dept => (
                        <Badge
                          key={dept.id}
                          variant="outline"
                          className="text-xs">
                          {dept.name}
                        </Badge>
                      ))}

                      {announcement.departments.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{announcement.departments.length - 2} more
                        </Badge>
                      )}

                      <div className="flex items-center text-gray-400 ml-auto">
                        <User className="h-3 w-3 mr-1" />
                        <span>{announcement.creator.name}</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-3 border-t border-gray-200 mt-3">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-2">
                        Full Content:
                      </h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <h6 className="font-medium mb-1">Created by:</h6>
                        <div className="text-gray-600">
                          <div>{announcement.creator.name}</div>
                          <div>
                            {announcement.creator.position} -{' '}
                            {announcement.creator.department?.name}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h6 className="font-medium mb-1">Departments:</h6>
                        <div className="flex flex-wrap gap-1">
                          {announcement.departments.map(dept => (
                            <Badge
                              key={dept.id}
                              variant="outline"
                              className="text-xs">
                              {dept.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Created:{' '}
                          {formatDateOnly(new Date(announcement.created_at))}
                        </span>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedAnnouncement(announcement)
                            }>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getImportanceBadge(announcement)}
                              {announcement.title}
                            </DialogTitle>
                            <DialogDescription>
                              By {announcement.creator.name} •{' '}
                              {formatDateOnly(
                                new Date(announcement.created_at),
                              )}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Content:</h4>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {announcement.content}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Creator:</h4>
                                <div className="text-sm text-gray-600">
                                  <div>{announcement.creator.name}</div>
                                  <div>{announcement.creator.email}</div>
                                  <div>{announcement.creator.position}</div>
                                  <div>
                                    {announcement.creator.department?.name}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  Target Departments:
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {announcement.departments.map(dept => (
                                    <Badge
                                      key={dept.id}
                                      variant="outline"
                                      className="text-xs">
                                      {dept.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <span className="text-gray-500">Expires: </span>
                                {getExpirationBadge(announcement)}
                              </div>
                              <div className="text-gray-500">
                                Status:{' '}
                                {announcement.is_active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        ) : (
          <div className="text-center py-8">
            {searchTerm || importanceFilter !== 'all' ? (
              <div>
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  No announcements match your search criteria
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm('')
                    setImportanceFilter('all')
                  }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div>
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No announcements available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnnouncementsCard
