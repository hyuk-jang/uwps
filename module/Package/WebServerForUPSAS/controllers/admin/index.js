module.exports = function (app) {
    SU.ChainingControllers(__dirname, app);

    if (app.get('env') === 'production') {
        app.use('/admin', function (req, res, next) {
            console.log(config)
            if (!req.user) {
                return res.redirect('/auth/login');
            }
            next();
        });
    }
}