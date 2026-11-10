module.exports = {
    content: ['./*.html', './dist/js/*.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
        },
    },
    daisyui: {
        themes: ['light'],
        darkTheme: 'light',
    },
    plugins: [require('daisyui')],
};
