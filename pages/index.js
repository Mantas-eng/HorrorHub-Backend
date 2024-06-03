import React from 'react';

import "../src/components/styles/styles.module.scss";
import Header from "../src/components/Header/Header";
import Navbar from "../src/components/Navbar/Navbar";
import DownloadSection from "../src/components/DownloadSection/downloadSection";
import Footer from "../src/components/Footer/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';  

function Main() {
    return (
        <div className="App">
            <Navbar />
            <div className="content">
                <Header />
            </div>
            <div className='Download'>
                <DownloadSection/>
            </div>
            <div className='Footer'>
                <Footer/>
            </div>
        </div>
    );
}

export default Main;