export const generateToken = (user, message, statudCode, res) => {

    const token = user.generateJsonWebToken();

    res.status(statudCode).cookie("token", token, {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly : true,
       })

    .json({
        success : true,
        message,
        user,
        token,
    });
          
};  