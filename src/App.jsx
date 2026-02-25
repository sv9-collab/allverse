import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Shield, Cpu, HardDrive, Terminal as TerminalIcon, Globe, Map as MapIcon } from 'lucide-react'
import { ThemeProvider, Box, Typography, Paper, LinearProgress } from '@mui/material'
import theme from './theme'
import Hypercore from './components/Hypercore'
import BiometricLogin from './components/BiometricLogin'

// Lazy load OrbMap to avoid Leaflet SSR issues
const OrbMap = React.lazy(() => import('./components/Map'))

const StatCard = ({ title, icon: Icon, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.19, 1, 0.22, 1] }}
    >
        <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>{title}</Typography>
                <Icon size={16} color="#00f2ff" />
            </Box>
            {children}
        </Paper>
    </motion.div>
)

export default function App() {
    const [isAuth, setIsAuth] = useState(false)
    const [stats, setStats] = useState({ cpu: 42, ram: 6.8, status: 'simulation' })
    const [logs] = useState([
        "[ORB-KERNEL] Systems online.",
        "[SEC-AUTH] Identity stevejohn verified.",
        "[HYPERCORE] Quantum tunnel established.",
        "[DB-LINK] Connected to orb_db.",
    ])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats({ cpu: parseFloat(data.cpu), ram: parseFloat(data.ram), status: data.status || 'live' })
                }
            } catch (e) {
                // silently fall back
            }
        }
        fetchStats()
        const interval = setInterval(fetchStats, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#020408', position: 'relative' }}>
                <Hypercore cpuLoad={stats.cpu} />

                <AnimatePresence mode="wait">
                    {!isAuth ? (
                        <BiometricLogin key="login" onAuthenticate={() => setIsAuth(true)} />
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            style={{ position: 'relative', zIndex: 10, padding: '2rem', height: '100vh', overflowY: 'auto' }}
                        >
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: '#00f2ff', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,242,255,0.6)' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 2, color: '#fff' }}>
                                        ORB OS <Box component="span" sx={{ opacity: 0.4 }}>// HYPERCORE</Box>
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'Fira Code', color: '#8b949e' }}>
                                        DB: <Box component="span" sx={{ color: stats.status === 'live' ? '#00f2ff' : '#ff4b2b' }}>
                                            {stats.status === 'live' ? 'LINKED' : 'SIM'}
                                        </Box>
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontFamily: 'Fira Code', color: '#8b949e' }}>GOD_MODE</Typography>
                                </Box>
                            </Box>

                            {/* Grid */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 5fr 3fr' }, gap: 3 }}>
                                {/* Left Col */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <StatCard title="Compute Load" icon={Cpu} delay={0.1}>
                                        <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{stats.cpu}%</Typography>
                                        <LinearProgress variant="determinate" value={Math.min(stats.cpu, 100)} sx={{ mt: 2, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#00f2ff' } }} />
                                    </StatCard>
                                    <StatCard title="Memory Mesh" icon={Activity} delay={0.2}>
                                        <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{stats.ram} GB</Typography>
                                        <LinearProgress variant="determinate" value={(stats.ram / 16) * 100} color="secondary" sx={{ mt: 2, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    </StatCard>
                                    <StatCard title="Storage Nodes" icon={HardDrive} delay={0.3}>
                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <Box key={i} sx={{ flex: 1, height: 30, bgcolor: i < 5 ? '#00f2ff' : 'rgba(255,255,255,0.1)', opacity: i < 5 ? 0.7 : 0.15, borderRadius: 1 }} />
                                            ))}
                                        </Box>
                                    </StatCard>
                                </Box>

                                {/* Middle Col */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <React.Suspense fallback={<Paper sx={{ p: 3, height: 300, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#8b949e' }}>Loading Map...</Typography></Paper>}>
                                        <OrbMap />
                                    </React.Suspense>
                                    <StatCard title="Quantum Logs" icon={TerminalIcon} delay={0.4}>
                                        <Box sx={{ fontFamily: 'Fira Code', fontSize: '0.8rem', color: '#00f2ff', height: 160, overflowY: 'auto' }}>
                                            {logs.map((log, i) => (
                                                <Box key={i} sx={{ mb: 0.5, opacity: 0.9 }}>{log}</Box>
                                            ))}
                                            <motion.div
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                style={{ display: 'inline-block', width: 8, height: 14, background: '#00f2ff', verticalAlign: 'middle' }}
                                            />
                                        </Box>
                                    </StatCard>
                                </Box>

                                {/* Right Col */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <StatCard title="Security Matrix" icon={Shield} delay={0.5}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {['UPLINK_SECURE', 'FIREWALL_MAX', 'ENCRYPT_256'].map(t => (
                                                <Box key={t} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="caption" sx={{ opacity: 0.5, color: '#fff' }}>{t}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#00f2ff', fontWeight: 700 }}>[ACTIVE]</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </StatCard>
                                    <StatCard title="Network Mesh" icon={Globe} delay={0.6}>
                                        <Box sx={{ height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                                style={{ width: 100, height: 100, border: '1px dashed #00f2ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.4 }}
                                            >
                                                <MapIcon size={28} color="#00f2ff" />
                                            </motion.div>
                                        </Box>
                                    </StatCard>
                                </Box>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </ThemeProvider>
    )
}
