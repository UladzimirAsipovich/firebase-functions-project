import { initializeApp } from 'firebase/app';
import { deleteDoc, getFirestore, addDoc, collection, setDoc, doc, query, where, getDocs, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaLpXID2bMzqzjuarte8NFpNsVEe8X9rw",
  authDomain: "test-fb-func-5fb7f.firebaseapp.com",
  projectId: "test-fb-func-5fb7f",
  storageBucket: "test-fb-func-5fb7f.appspot.com",
  messagingSenderId: "204772708520",
  appId: "1:204772708520:web:8617674d02dfa8554d329d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type T_requestUser = (userId: string) => Promise<null | I_Doc>

/**
 * Распарcенный документ из коллекции "users"
 */
export interface I_Doc {
  _docID: string;
  data: {
    id: string;
    score?: number;
    coins_left?: number;
    games_completed?: number;
    last_game_number?: number;
  }
}

/**
 * Функция, которая определяет (икрементировать или перезаписать) параметр
 * поля пользователя в соответствии с тестовым заданием.
 * @param userId 
 * @returns 
 */
export const requestUser: T_requestUser = async (userId) => {

  const q = query(collection(db, "users"), where("id", "==", userId));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const data: Array<I_Doc> = [];
  querySnapshot.forEach((doc) => {
    data.push({ _docID: doc.id, data: doc.data() as I_Doc["data"] });
  });
  return data[0];
};

type T_rewriteOrIncrement = (param1: number | undefined, condition: "=" | "+=") => number

/**
 * Функция, которая определяет (икрементировать или перезаписать) параметр
 * поля пользователя в соответствии с тестовым заданием.
 * @param param1 {number} Параметр которые необходимо икрементировать или перезаписать
 * @param condition {string} "+=" - инкрементация "=" - перезапись
 * @returns выходное значение (инкрементированное или нет).
 */
const rewriteOrIncrement: T_rewriteOrIncrement = (param1, condition = "+=") => {
  if (condition === "+=") {
    if (param1) {
      return param1 += 1;
    }
    return 1;
  }
  return param1 || 0;
};

type T_updateUser = (params: I_Doc['data']) => Promise<null | I_Doc['data']>;

/**
 * Функция, которая позволяет обновить (икрементировать или перезаписать)
 * поля пользователя "score", "coins_left", "last_game_number" и "games_completed"
 * в соответствии с тестовым заданием.
 */
export const updateUser: T_updateUser = async (params) => {

  try {

    if (!params.id) throw 'Необходимо добавить поле id: string';

    const foundedUser = await requestUser(params.id);

    if (!foundedUser) {
      const newDoc = await addDoc(collection(db, "users"), { ...params, score: 1 });
      const res = await getDoc(doc(db, "users", newDoc.id));
      return res.data() as I_Doc['data'];
    };

    const docRef = doc(db, "users", foundedUser._docID);

    await setDoc(docRef, {
      ...params,
      score: rewriteOrIncrement(foundedUser.data.score, '+='), // "+=" - increment, "=" - rewrite
      coins_left: params.coins_left ? params.coins_left : rewriteOrIncrement(foundedUser.data.coins_left, "="), // "+=" - increment, "=" - rewrite
      last_game_number: params.last_game_number ? params.last_game_number : rewriteOrIncrement(foundedUser.data.last_game_number, "="), // "+=" - increment, "=" - rewrite
      games_completed: rewriteOrIncrement(foundedUser.data.games_completed, params.coins_left === 50 ? "+=" : "=") // "+=" - increment, "=" - rewrite

    }, { merge: true });

    const afterUpdate = await getDoc(docRef);
    return afterUpdate.data() as I_Doc['data'];

  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Функция, которая позволяет получить ВСЕ документы в коллекции "users"
 * @param collectionStore {string} Название коллекции
 * @returns Полученные документы из коллекции
 */
const gettingAllDocsFormCollection = async (collectionStore: "users") => {
  const res = await getDocs(collection(db, collectionStore));
  const data: Array<I_Doc> = [];
  res.forEach((doc) => {
    data.push({ _docID: doc.id, data: doc.data() as I_Doc["data"] });
  });
  return data;
};

/**
 * Функция, которая добавляет исходные документы в коллекцию "users"
 * в соответствии с тестовым заданием
 * @returns Булево значение выражающее успех операции
 */
const AddDefaultDocs: () => Promise<boolean> = async () => {
  try {
    await addDoc(collection(db, "users"), { id: "Alex", score: 24 });
    await addDoc(collection(db, "users"), { id: "1234", points: 14, somefield: "something", foo: "bar" });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/**
 * Функция, восстанавливающая документы в коллекции "users" в исходное
 * значение в соответствии с тестовым заданием.
 * @returns Полученные документы из коллекции
 */
export const restoreToDefault: () => Promise<I_Doc[]> = async () => {

  const querySnapshot = await getDocs(collection(db, "users"));

  if (querySnapshot.empty) {
    await AddDefaultDocs();
  } else {
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, "users", document.id));
    });
    await AddDefaultDocs();
  }

  const res = await gettingAllDocsFormCollection('users');
  return res;
};