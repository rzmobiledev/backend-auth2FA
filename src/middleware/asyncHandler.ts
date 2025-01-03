import {Request, Response, NextFunction} from 'express'

type AsyncControllerType = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>

export const asyncHandler = (controller: AsyncControllerType): AsyncControllerType =>
    async(req: Request, res: Response, next: NextFunction): Promise<void> => {
        try{
            await controller(req, res, next)
        }catch(err){
            next(err)
        }
    }