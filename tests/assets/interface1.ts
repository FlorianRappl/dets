export interface CustomMerged {

}

export interface Merged extends CustomMerged {
    A: string;
    B: string;
}

export interface CustomMerged {
    C: string;
    D: string;
}
