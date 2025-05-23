import React from 'react'

const UserTableSkelton = () => {
    return (
        <tr className="text-sm animate-pulse">
            <td className="py-3"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
            <td className="py-3"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
            <td className="py-3"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
            <td className="py-3 text-right"><div className="h-8 bg-gray-700 rounded w-24 ml-auto"></div></td>
        </tr>
    )
}

export default UserTableSkelton