export enum UserType {
    ADMIN = 1,
    USER = 2
}

export interface Register{
    name: string,
    email: string,
    cell: string,
    password: string,
    userType: UserType
}