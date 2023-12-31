import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { API_URL, doApiMethodSignUpLogin, TOKEN_NAME } from '../../../services/apiService';
import { getUserInfo } from '../../../redux/featchers/userSlice';
import {  useSelector } from 'react-redux';
import Profile from './profileInput';
import Topic from './topicList';
import Education from './educationInput';
import Location from './locationInput';
import RangeQ1 from './rangeQuestion1';
import RangeQ2 from './rangeQuestion2';
import { verifyToken } from '../../../services/apiService';

const AppRegister = () => {

  const dispatch = useDispatch();
  const nav = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { handleSubmit} = useForm();

  const steps = [
    { id: 'profile', component: <Profile /> },
    { id: 'location', component: <Location /> },
    { id: 'education', component: <Education /> },
    { id: 'topic', component: <Topic /> },
    { id: 'rangeQ1', component: <RangeQ1 /> },
    { id: 'rangeQ2', component: <RangeQ2 /> },
  ];

  let user = useSelector(myStore=>myStore.userSlice.user)
  const userWithoutVerifyPassword = { ...user };
  delete userWithoutVerifyPassword.verifyPassword;

  const onSubmit = async () => {
    setIsSubmitted(true);
    try {
      // if there is a token and valid the 
      console.log("data",userWithoutVerifyPassword);
      const url = API_URL + '/auth/register';
      const data = await doApiMethodSignUpLogin(url, 'POST', userWithoutVerifyPassword);
  
      if (data.data.token) {
        localStorage.setItem(TOKEN_NAME, data.data.token);
  
        const decodedToken = data.data.token;
        const vToken = verifyToken(decodedToken).then(verifiedToken => {
          if (verifiedToken.role === "admin") {
            console.log(verifiedToken.role);
            nav("/admin");
          } else if (verifiedToken.role === "user") {
            console.log(verifiedToken.role);
            nav("/user");
          } else {
            nav("/");
          }

          window.location.reload();

        });
      }
      dispatch(getUserInfo());
    } catch (error) {
      setIsSubmitted(false);
      alert(error.data ? error.data.data.msg : 'An error occurred');
    }
  };
  
  
  const handleContinueClick = () => {
    if (currentStep < 6) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      handleSubmit(onSubmit);
    }
  };

  const handleBackClick = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  return (
    <div className='container '>
      <div className='row'>
        <form onSubmit={handleSubmit(onSubmit)}>
          {steps.map((step, index) => (
            <div key={index} style={{ display: currentStep === index ? 'block' : 'none' }}>
              {step.component}
            </div>
          ))}
          <div className='container'>
            <div className='row'>
              <button type='button' className='btn btn-secondary col-2 mx-2' onClick={handleBackClick}>
                Back
              </button>
              {currentStep === 5 ? (
                <button type='submit' className='btn btn-success col-2 mx-2' disabled={isSubmitted}>
                  Submit
                </button>
              ) : (
                <button type='button' className='btn btn-info col-2 mx-2' onClick={handleContinueClick}>
                  Continue
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppRegister;
