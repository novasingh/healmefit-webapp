import { Link } from "react-router-dom"

const PageNotFound = () => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', height: '100%', width: '100%', flexDirection: 'column' , alignItems: 'center'}}>
            <h1>Page Not Found</h1>
            <Link to="/">Login In</Link>
        </div>
    )
}
export default PageNotFound