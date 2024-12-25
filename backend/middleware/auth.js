import jwt from 'jsonwebtoken';
import User from '../models/User.js.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Veuillez vous authentifier.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                throw new Error();
            }
            next();
        });
    } catch (error) {
        res.status(403).send({ error: 'Accès refusé.' });
    }
};

export default { auth, adminAuth };
export { auth, adminAuth };