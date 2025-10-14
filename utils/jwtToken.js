export const generateToken = (user, message, statudCode, res) => {
        const token = user.generateJsonWebToken();
        const isProd = process.env.NODE_ENV === 'production';

        res
            .status(statudCode)
            .cookie("token", token, {
                expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
                httpOnly: true,
                sameSite: isProd ? 'none' : 'lax',
                secure: isProd, // required by browsers when sameSite is none
            })
            .json({
                success: true,
                message,
                user,
                token,
            });
};  