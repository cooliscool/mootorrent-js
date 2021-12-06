module.exports.info = (location, message)=>{
    const level = 'info'
    console.log(level + ' :: ' + location + ' :: ');
    console.log(message);
    // console.log('\n');
    // TODO: use process.stdout to print in a single line 
}

module.exports.error = (location, message)=>{
    const level = 'error'
    console.error(level + ' :: ' + location + ' :: ');
    console.error(message);
    // console.log('\n');
}


module.exports.debug = (message)=>{
    const level = 'debug'
    console.log(level + ' : ' + JSON.stringify(message));
}

