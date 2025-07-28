import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Clock, Globe, Calendar, Calculator, Moon, Sun, Timer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// City data for timezone calculations
const cities = [
  { name: "USA - Baker Island", timeZone: "Etc/GMT+12" },
  { name: "USA - Honolulu, HI", timeZone: "Pacific/Honolulu" },
  { name: "USA - Anchorage, AK", timeZone: "America/Anchorage" },
  { name: "USA - Los Angeles, CA", timeZone: "America/Los_Angeles" },
  { name: "USA - Denver, CO", timeZone: "America/Denver" },
  { name: "USA - Chicago, IL", timeZone: "America/Chicago" },
  { name: "USA - New York, NY", timeZone: "America/New_York" },
  { name: "Venezuela - Caracas", timeZone: "America/Caracas" },
  { name: "Canada - Halifax", timeZone: "America/Halifax" },
  { name: "Argentina - Buenos Aires", timeZone: "America/Argentina/Buenos_Aires" },
  { name: "South Georgia - South Georgia", timeZone: "Atlantic/South_Georgia" },
  { name: "Portugal - Azores", timeZone: "Atlantic/Azores" },
  { name: "Iceland - Reykjavik", timeZone: "Atlantic/Reykjavik" },
  { name: "UK - London", timeZone: "Europe/London" },
  { name: "Germany - Berlin", timeZone: "Europe/Berlin" },
  { name: "Egypt - Cairo", timeZone: "Africa/Cairo" },
  { name: "Russia - Moscow", timeZone: "Europe/Moscow" },
  { name: "Iran - Tehran", timeZone: "Asia/Tehran" },
  { name: "UAE - Dubai", timeZone: "Asia/Dubai" },
  { name: "Afghanistan - Kabul", timeZone: "Asia/Kabul" },
  { name: "Pakistan - Karachi", timeZone: "Asia/Karachi" },
  { name: "India - New Delhi", timeZone: "Asia/Kolkata" },
  { name: "Nepal - Kathmandu", timeZone: "Asia/Kathmandu" },
  { name: "Bangladesh - Dhaka", timeZone: "Asia/Dhaka" },
  { name: "Myanmar - Yangon", timeZone: "Asia/Yangon" },
  { name: "Thailand - Bangkok", timeZone: "Asia/Bangkok" },
  { name: "Singapore - Singapore", timeZone: "Asia/Singapore" },
  { name: "Australia - Eucla", timeZone: "Australia/Eucla" },
  { name: "Japan - Tokyo", timeZone: "Asia/Tokyo" },
  { name: "Australia - Adelaide", timeZone: "Australia/Adelaide" },
  { name: "Australia - Sydney", timeZone: "Australia/Sydney" },
  { name: "New Caledonia - Nouméa", timeZone: "Pacific/Noumea" },
  { name: "New Zealand - Auckland", timeZone: "Pacific/Auckland" },
  { name: "New Zealand - Chatham Islands", timeZone: "Pacific/Chatham" },
  { name: "Samoa - Apia", timeZone: "Pacific/Apia" },
  { name: "Kiribati - Kiritimati", timeZone: "Pacific/Kiritimati" }
];

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState('Sunday')
  const [timeInput, setTimeInput] = useState('00:00:00')
  const [calculatedSeconds, setCalculatedSeconds] = useState(null)
  const [nighttimeLocations, setNighttimeLocations] = useState([])
  const [workWeekProgress, setWorkWeekProgress] = useState({ percentage: 0, text: '', isActive: false })
  const [isDarkMode, setIsDarkMode] = useState(true)

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Update nighttime locations every minute
  useEffect(() => {
    const updateNighttimeLocations = () => {
      const inNight = cities.filter(city => {
        const hour = getHourInTimeZone(city.timeZone)
        return hour >= 1 && hour < 5
      })
      setNighttimeLocations(inNight)
    }

    updateNighttimeLocations()
    const timer = setInterval(updateNighttimeLocations, 60000)
    return () => clearInterval(timer)
  }, [])

  // Update work week progress every minute
  useEffect(() => {
    const updateWorkWeekProgress = () => {
      const now = new Date()
      const totalWorkMs = 5 * 8.5 * 60 * 60 * 1000 // 42.5 hours in ms

      // Calculate Monday 09:00 of this week
      const currentDay = now.getDay()
      const daysFromMonday = (currentDay + 6) % 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - daysFromMonday)
      monday.setHours(9, 0, 0, 0)

      let workedMs = 0

      for (let i = 0; i < 5; i++) {
        const workStart = new Date(monday)
        workStart.setDate(monday.getDate() + i)
        workStart.setHours(9, 0, 0, 0)

        const workEnd = new Date(workStart)
        workEnd.setHours(17, 30, 0, 0)

        if (now >= workEnd) {
          workedMs += 8.5 * 60 * 60 * 1000
        } else if (now >= workStart && now < workEnd) {
          workedMs += now - workStart
          break
        } else if (now < workStart) {
          break
        }
      }

      const percentComplete = (workedMs / totalWorkMs) * 100
      const percentLeft = 100 - percentComplete

      // Detect if now is outside work hours or weekend
      const isWeekend = currentDay === 0 || currentDay === 6
      const beforeWorkday = now < monday
      const beforeTodayWorkStart = (now.getHours() < 9) || (now.getHours() === 9 && now.getMinutes() === 0 && now.getSeconds() === 0)
      const afterWorkHours = (now.getHours() > 17) || (now.getHours() === 17 && now.getMinutes() > 30)

      const outsideHours = isWeekend || beforeWorkday || afterWorkHours || beforeTodayWorkStart

      setWorkWeekProgress({
        percentage: percentComplete,
        text: outsideHours ? 'Outside of work hours' : `${percentComplete.toFixed(2)}% Completed / ${percentLeft.toFixed(2)}% Remaining`,
        isActive: !outsideHours
      })
    }

    updateWorkWeekProgress()
    const timer = setInterval(updateWorkWeekProgress, 60000)
    return () => clearInterval(timer)
  }, [])

  const getTimeInTimeZone = (timeZone) => {
    const now = new Date()
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timeZone
    }).format(now)
  }

  const getHourInTimeZone = (timeZone) => {
    const now = new Date()
    return parseInt(new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: timeZone
    }).format(now))
  }

  const calculateSeconds = () => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
    if (!timeRegex.test(timeInput)) {
      setCalculatedSeconds('Invalid time format. Please use HH:MM:SS.')
      return
    }

    const timeParts = timeInput.split(':')
    const hours = parseInt(timeParts[0], 10)
    const minutes = parseInt(timeParts[1], 10)
    const seconds = parseInt(timeParts[2], 10)

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59 ||
        seconds < 0 || seconds > 59) {
      setCalculatedSeconds('Invalid time values. Hours (0-23), Minutes (0-59), Seconds (0-59).')
      return
    }

    const dayIndex = days.indexOf(selectedDay)
    const secondsInADay = 24 * 60 * 60
    const secondsFromDays = dayIndex * secondsInADay
    const secondsFromTime = hours * 60 * 60 + minutes * 60 + seconds
    const totalSeconds = secondsFromDays + secondsFromTime

    setCalculatedSeconds(totalSeconds.toLocaleString())
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Timer className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                JBA Toolkit Enhanced
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Advanced time calculations and productivity tracking
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="mt-4"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </motion.div>

          {/* Current Time Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Current Time</span>
                </div>
                <div className="text-3xl font-mono font-bold mb-1">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(currentTime)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Seconds Calculator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Seconds Since Sunday 00:00:00
                  </CardTitle>
                  <CardDescription>
                    Calculate total seconds elapsed from Sunday midnight to any day and time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="day-select">Day</Label>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger id="day-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time-input">Time (HH:MM:SS)</Label>
                    <Input
                      id="time-input"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      placeholder="HH:MM:SS"
                      className="font-mono"
                    />
                  </div>
                  
                  <Button onClick={calculateSeconds} className="w-full">
                    Calculate Seconds
                  </Button>
                  
                  <AnimatePresence>
                    {calculatedSeconds !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-muted rounded-lg"
                      >
                        <div className="text-sm text-muted-foreground mb-1">Result:</div>
                        <div className="font-mono text-lg font-semibold">
                          {typeof calculatedSeconds === 'number' ? 
                            `${calculatedSeconds} seconds` : 
                            calculatedSeconds
                          }
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Work Week Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Work Week Progress
                  </CardTitle>
                  <CardDescription>
                    Track your 42.5-hour work week (Monday-Friday, 9:00 AM - 5:30 PM)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{workWeekProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={workWeekProgress.percentage} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={workWeekProgress.isActive ? "default" : "secondary"}>
                      {workWeekProgress.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {workWeekProgress.text}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Work hours: Monday-Friday, 9:00 AM - 5:30 PM (42.5 hours total)
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Nighttime Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Locations Currently in Nighttime (1AM–5AM)
                </CardTitle>
                <CardDescription>
                  Real-time tracking of locations experiencing deep night hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {nighttimeLocations.length === 0 ? (
                    <motion.div
                      key="no-locations"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No locations currently between 1AM–5AM</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="locations-grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                      {nighttimeLocations.map((city, index) => (
                        <motion.div
                          key={city.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 bg-muted rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {city.name}
                            </div>
                          </div>
                          <div className="font-mono text-sm text-muted-foreground ml-2">
                            {getTimeInTimeZone(city.timeZone)}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 text-sm text-muted-foreground"
          >
            © 2025 JBA Toolkit Enhanced - Built with React & Tailwind CSS
          </motion.footer>
        </div>
      </div>
    </div>
  )
}

export default App

