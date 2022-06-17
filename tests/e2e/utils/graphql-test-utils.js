// Utility to match GraphQL based on the first words
export const hasQueryName = (req, queryName) => {
    const { body } = req
    return (
        body.query && body.query.search(queryName)  > -1
    )
  }