import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import cookieParser from 'cookie-parser';
import { notFound } from './app/errors/NotFoundError';
import router from './app/routes';

const app: Application = express();
app.use(cors());
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send({
        Message: "Skill Sync Server is running..."
    })
});

app.use('/api/v1', router);

app.use(globalErrorHandler);

app.use(notFound)

export default app;