import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView , ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../Config.js'


export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }
    

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    handleTransaction = () => {
      var transactionMessage
      db.collection("Books").doc(this.state.scannedBookId).get()
      .then((doc) => {
        var book = doc.data()
        if (book.bookAvalability){
          this.initiate_book_issue()
          TransactionMessage = "Book issued"
          ToastAndroid.show(TransactionMessage, ToastAndroid.SHORT)
        }
        else { 
          this.initiate_book_return()
          TransactionMessage = "Book returned"
          ToastAndroid.show(TransactionMessage, ToastAndroid.SHORT)
        }
      })
      this.setState({
        TransactionMessage: TransactionMessage
      })
    }
    initiate_book_issue = async () => {
      db.collection("Transactions").add({
        'studentID': this.state.scannedStudentId,
        'bookID': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'TransactionType': "Issue",
        
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': false,
        
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })
      Alert.alert("bookIssued")
      this.setState({
        scannedBookId: '',
        scannedStudentId: '' 
      })
    }
     
    initiate_book_return = async () => {
      db.collection("Transactions").add({
        'studentID': this.state.scannedStudentId,
        'bookID': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'TransactionType': "Return",
      })

      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true,
        
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })

      Alert.alert("bookReturn")
      this.setState({
        scannedBookId: '',
        scannedStudentId: '' 
      })
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>  
          <View style={styles.container}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText = {Text => this.setState({
                scannedBookId: Text
              })}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText = {Text => this.setState({
                scannedStudentId: Text
              })}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style = {styles.SubmitButton} onPress = {async() => {this.handleTransaction()
            this.setState({
              scannedBookId: '',
              scannedStudentId: ''
            })}}> 
            <Text style = {styles.SubmitButtonText}> Submit </Text>
             </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    SubmitButton: {
      backgroundColor: '#2196F3',
      width: 150,
      height: 50
    },
    SubmitButtonText:{
       textAlign: 'center',
       fontSize: 25,
       color: "red"
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });