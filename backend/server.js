import express from 'express';
import connectDB from './config/config.js';
import userRoutes from './routes/Usignup.js';
import UloginRoutes from './routes/Ulogin.js';
import RsignupRoutes from './routes/Rsignup.js';
import riderRoutes from './routes/riderRoutes.js';
import cityRoutes from './routes/riderRoutes.js';
import areaRoutes from './routes/riderRoutes.js';
import aadharRoutes from './routes/riderRoutes.js';
import uploadPhotoRoutes from './routes/riderRoutes.js';
import PaymentRoutes from './routes/riderRoutes.js';
import statusRoutes from './routes/riderRoutes.js';
import AadharRoutes from './aadharverify/Aadhar_Verification.js';

import cors from 'cors';

const app = express();

connectDB();``

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/user', UloginRoutes);
app.use('/api/rider', RsignupRoutes);
app.use('/api/rider', AadharRoutes);
app.use("/api/rider", riderRoutes);
app.use("/api/rider", cityRoutes);
app.use("/api/rider", areaRoutes);
app.use("/api/rider", aadharRoutes);
app.use("/api/rider", uploadPhotoRoutes);
app.use("/api/rider", PaymentRoutes);
app.use("/api/rider", statusRoutes);

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => console.log(`Server started on port ${PORT}`));