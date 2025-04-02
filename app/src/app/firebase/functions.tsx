// src/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { auth, db, storage } from ".";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface ApiAuth {
  email: string;
  firstName: string;
  lastName: string;
  password:string;
  profilePicture: string;
}
export class UserAuth {
  email: string;
  uid: string;
  firstName: string;
  lastName: string;
  profilePictureURL: string;

  constructor(
    email: string,
    uid: string,
    firstName: string,
    lastName: string,
    profilePictureURL: string
  ) {
    this.email = email;
    this.uid = uid;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePictureURL = profilePictureURL;
  }

  // Static method to create a UserAuth instance from Firestore data
  static fromFirestore(uid: string, data: any): UserAuth {
    return new UserAuth(
      data.email,
      uid,
      data.firstName,
      data.lastName,
      data.profilePictureURL
    );
  }
}

// Function to register a new user
export const registerWithEmailAndPassword = async (
  dataUser: ApiAuth
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      dataUser.email,
      dataUser.password
    );
    // Get the user ID (UID)
    const user = userCredential.user;

    // Save additional user information in the Firestore "users" collection
    await setDoc(doc(db, "users", user.uid), {
      firstName: dataUser.firstName,
      lastName: dataUser.lastName,
      email: dataUser.email,
      profilePictureURL: "",
      createdAt: new Date(),
    });
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserAuth> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Fetch user data from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const result: UserAuth = {
        uid: user.uid,
        email: user.email ?? "",
        firstName: userData?.firstName ?? "",
        lastName: userData?.lastName ?? "",
        profilePictureURL: userData?.profilePictureURL ?? "",
      };
      return result;
    } else {
      throw new Error("User data not found in Firestore.");
    }
  } catch (error) {
    throw error;
  }
};

export const getUserFirebase = async (uid: string): Promise<UserAuth> => {
  try {
    // Fetch user data from Firestore
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return UserAuth.fromFirestore(uid, userData);
    } else {
      throw new Error("User data not found in Firestore.");
    }
  } catch (error) {
    throw error;
  }
};

export const updateUserFirebase = async (
  uid: string,
  updatedData: any
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", uid);
    // Update the user document with the provided updated data
    await updateDoc(userDocRef, updatedData);
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};
// Function to log out the user
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const uploadProfilePicture = async (
  uid: string,
  file: File
): Promise<void> => {
  try {
    // Create a reference to the user's profile picture in Firebase Storage
    const storageRef = ref(storage, `profilePictures/${uid}`);

    // Upload the image to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, file);

    // Get the download URL of the uploaded image
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Update the user's document in Firestore with the image URL
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      profilePictureURL: downloadURL,
    });

    console.log("Profile picture uploaded and URL saved successfully");
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};
