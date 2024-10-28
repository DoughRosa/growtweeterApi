import generateHash from "../../src/utils/generateHash"

describe('este teste do utils generateHash', ()=>{
    test('deveria retornar uma hash ao executar o generateHash', ()=>{
        let hash = generateHash('12345');

        expect(hash.length).toEqual(60);
    })
})