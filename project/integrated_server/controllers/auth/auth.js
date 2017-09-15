module.exports = function (passport) {
    var router = require("express").Router();

    // login 
    router.get("/login", function (req, res) {
        res.render("./auth/login.html", { err: req.flash("error") });
    });
    
    router.post("/login", passport.authenticate("local", {
        successRedirect: "/admin/server",
        failureRedirect: "/auth/login",
        failureFlash: true
    }));

    router.get("/logout", function (req, res) {
        req.logOut();

        req.session.save(function (err) {
            if (err) {
                console.log("logout error");
            }
            return res.redirect("/auth/login");
        })
    })

    return {
        auth: router
    };
}