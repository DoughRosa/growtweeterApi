import {Router} from 'express'
import AuthController from '../controllers/auth.controller';

const routes = () => {
    const router = Router();
    const controller = new AuthController();

    router.post('/', controller.store);

    router.get('/test', (req, res)=>{
        res.status(200).json('TESTANDO')
    })

    return router;
};

export default routes;