import { Request, Response, NextFunction } from "express";

export const incomingResourceBodyDataAttributesTransformer = (
  transformations: Record<string, (val: any) => any>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (req.body.data && req.body.data.attributes) {
        for (const [key, transformation] of Object.entries(transformations)) {
          const attributeValue = req.body.data.attributes[key];
          if (attributeValue !== undefined) {
            req.body.data.attributes[key] = await transformation(
              attributeValue
            );
          }
        }
      }

      return next();
    } catch (err: any) {
      return next(
        new Error(
          `Error during incoming resource transformation: ${err.message}`
        )
      );
    }
  };
};
