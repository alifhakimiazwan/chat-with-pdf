"use client";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Inbox } from "lucide-react";
import { uploadToS3 } from "@/lib/db/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1, // Accept only PDF files
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);

        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/dashboard/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("Error creating chat");
            console.error(err);
          },
        });
        console.log("data", data);
      } catch (err) {
        console.log(err);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps({
        className:
          "dropzone border-dashed border-2 border-gray-300 rounded-lg  p-6 hover:border-primary transition duration-200 ease-in-out",
      })}
    >
      <input className="hidden" {...getInputProps()} />
      <div className="flex flex-col items-center text-center">
        {uploading || isPending ? (
          <>
            <Loader2 className="text-primary h-10 w-10 animate-spin"></Loader2>
            <p className="text-sm mt-3 text-gray-400">Hold on a second...</p>
          </>
        ) : (
          <>
            <Inbox className="text-primary mb-2" />
            <p className="dropzone-content text-gray-600 text-sm">
              Drag PDF files here, or click to select files
            </p>
            <span className="text-xs text-gray-400">Max file size: 10MB</span>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
