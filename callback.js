const addSum = (a, b, callback) => {
    setTimeout(()=> {
        if(typeof a !== 'number' || typeof b !== 'number') return callback('a, b must be numbers')
        callback(undefined, a + b)
    }, 3000);
}

// let callback = (error, sum) => {
//     if(error) console.log({ error });
//     console.log({sum});
// }

addSum(10, 10, (error, sum1) => {
    if(error) return console.log({ error });
    console.log({ sum1 })
    addSum(sum1, 15, (error2, sum2) => {
        if(error2) return console.log({error2})
        console.log({sum2})
    })
})