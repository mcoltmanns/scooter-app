/*

*/
export class Levenshtein{
    static levenshteinMethod(a: string, b: string): number{
        const an = a ? a.length : 0;
        const bn = b ? b.length : 0;
        if (an === 0) {
          return bn;
        }
        if (bn === 0) {
          return an;
        }
        const matrix = new Array(an + 1);
        for (let i = 0; i <= an; i++) {
          matrix[i] = new Array(bn + 1);
          matrix[i][0] = i;
        }
        for (let j = 0; j <= bn; j++) {
          matrix[0][j] = j;
        }
        for (let i = 1; i <= an; i++) {
          for (let j = 1; j <= bn; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
          }
        }
        return matrix[an][bn];
    }
}