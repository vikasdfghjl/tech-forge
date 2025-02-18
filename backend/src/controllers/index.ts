export class IndexController {
    public getWelcome(req: any, res: any): void {
        res.send("Welcome to Tech Forge");
    }
}