import DocumentPicker from "react-native-document-picker";
import { stat } from "react-native-fs";
import IFile from "../models/file";

export async function pickDocument(): Promise<IFile> {
  const selectedFile = await DocumentPicker.pick({
    type: [DocumentPicker.types.audio]
  });
  const fileStats = await stat(selectedFile.uri);
  return {uri: fileStats.originalFilepath, name: selectedFile.name};
}