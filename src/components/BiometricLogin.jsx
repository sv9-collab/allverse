import React, { useState, useCallback, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Fade } from '@mui/material';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import FaceIcon from '@mui/icons-material/Face';

export default function BiometricLogin({ onAuthenticate }) {
    const [scanning, setScanning] = useState(false);
    const [method, setMethod] = useState(null); // 'face' or 'fingerprint'
    const webcamRef = useRef(null);

    const startScan = (type) => {
        setMethod(type);
        setScanning(true);

        // Artificial delay to simulate biometric processing
        setTimeout(() => {
            setScanning(false);
            onAuthenticate();
        }, 3000);
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                background: 'radial-gradient(circle at center, rgba(2, 4, 8, 0.8) 0%, #020408 100%)',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
                <Box
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 6,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(40px)',
                        maxWidth: 450,
                        width: '90%',
                    }}
                >
                    {scanning ? (
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 4 }}>
                            {method === 'face' ? (
                                <Box sx={{ position: 'relative', width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', border: '2px solid #00f2ff' }}>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        width={200}
                                        height={200}
                                        videoConstraints={{ width: 200, height: 200, facingMode: "user" }}
                                        style={{ borderRadius: '50%' }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                                            bgcolor: '#00f2ff', boxShadow: '0 0 15px #00f2ff',
                                            animation: 'scan 1.5s ease-in-out infinite'
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <FingerprintIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} className="badge-glow" />
                                    <CircularProgress size={100} thickness={2} sx={{ position: 'absolute', top: -10 }} />
                                </Box>
                            )}
                            <style>{`
                @keyframes scan {
                  0% { top: 0; }
                  50% { top: 100%; }
                  100% { top: 0; }
                }
              `}</style>
                        </Box>
                    ) : (
                        <Box sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'primary.main', borderRadius: '50%', m: '0 auto 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px rgba(0, 242, 255, 0.4)' }}>
                            <FaceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Box>
                    )}

                    <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1, color: '#fff' }}>ORB OS</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', letterSpacing: 4, mb: 4 }}>BIOMETRIC AUTH REQUIRED</Typography>

                    {!scanning && (
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<FaceIcon />}
                                onClick={() => startScan('face')}
                                sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: 'text.primary' }}
                            >
                                FACE SCAN
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<FingerprintIcon />}
                                onClick={() => startScan('fingerprint')}
                                sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: 'text.primary' }}
                            >
                                FINGERPRINT
                            </Button>
                        </Box>
                    )}

                    {scanning && (
                        <Typography variant="caption" sx={{ color: 'primary.main', letterSpacing: 2, display: 'block', mt: 2 }}>
                            {method === 'face' ? 'ANALYZING NEURAL PATTERNS...' : 'VERIFYING BIOMETRICS...'}
                        </Typography>
                    )}
                </Box>
            </motion.div>
        </Box>
    );
}
