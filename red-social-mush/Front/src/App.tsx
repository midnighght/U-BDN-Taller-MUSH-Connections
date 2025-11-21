import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import './App.css';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import UserProfilePage from './pages/UserProfilePage';
import RequestsPage from './pages/RequestsPage';
import CommunityPage from './pages/CommunityPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/RegisterPage" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/communities/:communityId" element={<CommunityPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;