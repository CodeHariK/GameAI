export class Blackboard {
    private data: Map<string, any> = new Map();

    set(key: string, value: any): void {
        this.data.set(key, value);
    }

    get<T>(key: string): T | undefined {
        return this.data.get(key);
    }

    has(key: string): boolean {
        return this.data.has(key);
    }

    remove(key: string): void {
        this.data.delete(key);
    }
}
