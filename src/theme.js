import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00f2ff',
        },
        secondary: {
            main: '#7000ff',
        },
        background: {
            default: '#020408',
            paper: 'rgba(13, 17, 23, 0.7)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#8b949e',
        },
    },
    typography: {
        fontFamily: "'Outfit', sans-serif",
        h2: {
            letterSpacing: '8px',
            fontWeight: 700,
        },
        button: {
            letterSpacing: '2px',
            fontWeight: 700,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 24,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 100,
                    padding: '12px 32px',
                },
            },
        },
    },
});

export default theme;
