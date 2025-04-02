
export async function getSetting(settingName: string, db: any) {
  const settingSnapshot = await db
    .collection("settings")
    .doc(settingName)
    .get();
  return settingSnapshot.data().value;
}