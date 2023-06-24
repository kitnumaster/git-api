exports.Filter = (filterType = {}, filter = '', filterBy = '') => {

    let query = {}
    if (filterType['as'] && filterType['as'].includes(filter)) {
        query = { [filter]: filterBy }
    }
    if (filterType['like'] && filterType['like'].includes(filter)) {
        // /^abc.*/
        let string = filterBy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        console.log(string)
        query = { [filter]: { $regex: new RegExp('^' + filterBy + '.*') } }
    }

    return query
}