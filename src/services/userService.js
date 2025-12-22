import api from './axios/axios.customize';

const Register = (data) => {
    const URL_API = "/User/register";
    return api.post(URL_API, data);
};

const Login = (data) => {
    const URL_API = "/User/login";
    return api.post(URL_API, data);
};

const GetAllUsers = () => {
    const URL_API = "/User";
    return api.get(URL_API);
};

const GetUser = (userName) => {
    const URL_API = `/User/${userName}`;
    return api.get(URL_API);
};

const UpdateUser = (userName, data) => {
    const URL_API = `/User/${userName}`;
    return api.put(URL_API, data);
};

const AddUser = (data) => {
    const URL_API = "/User/add";
    return api.post(URL_API, data);
};

const AdminUpdateUser = (data) => {
    const URL_API = "/User/admin/update";
    return api.put(URL_API, data);
};

const DeleteUser = (userName) => {
    const URL_API = `/User/${userName}`;
    return api.delete(URL_API);
};

const ChangePassword = (data) => {
    const URL_API = "/User/change-password";
    return api.post(URL_API, data);
};

const ForgotPassword = (email) => {
    const URL_API = `/User/forgot-password?email=${email}`;
    return api.post(URL_API);
};

const ResetPassword = (data) => {
    const URL_API = "/User/reset-password";
    return api.post(URL_API, data);
};

const SendEmailConfirmation = (email) => {
    const URL_API = `/User/send-email-confirmation?email=${email}`;
    return api.post(URL_API);
};

const ConfirmEmail = (email, token) => {
    const URL_API = `/User/confirm-email?email=${email}&token=${token}`;
    return api.post(URL_API);
};

const UpdateAvatar = (userName, url) => {
    const URL_API = `/User/${userName}/avatar`;
    return api.put(URL_API, JSON.stringify(url), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export {
    Register,
    Login,
    GetAllUsers,
    GetUser,
    UpdateUser,
    AddUser,
    AdminUpdateUser,
    DeleteUser,
    ChangePassword,
    ForgotPassword,
    ResetPassword,
    SendEmailConfirmation,
    ConfirmEmail,
    UpdateAvatar,
};