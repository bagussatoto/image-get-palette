module.exports = {
    content: ['./*.html', './src/js/*.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
        },
    },
    daisyui: {
        themes: ['light', 'dark'],
        darkTheme: 'light',
    },
    plugins: [require('daisyui')],
};
