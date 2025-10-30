// // filepath: /src/App.tsx

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { HomePage } from '@/pages/HomePage';
// import { SignUpPage } from '@/pages/SignUpPage';
// import { SignInPage } from '@/pages/SignInPage';
// import { ProfilePage } from '@/pages/ProfilePage';

// function App() {
//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<HomePage />} />
//                 <Route path="/signup" element={<SignUpPage />} />
//                 <Route path="/signin" element={<SignInPage />} />
//                 <Route path="/profile" element={<ProfilePage />} />
//             </Routes>
//         </Router>
//     );
// }

// export default App;
// filepath: /src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;
