import { Text } from "@tbe/components";
import type { ExampleCardProps } from "@tbe/interface";
import React from "react";

const ExampleCard = ({
  index,
  inputText,
  outputText,
  explanation,
  image,
}: ExampleCardProps) => {
  return (
    <div className="space-y-1.5">
      <Text level="p" className="text-sm font-medium text-gray-300">
        Example {index + 1}:
      </Text>
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row border-b border-gray-800 last:border-0">
          <div className="flex-1 min-w-0 p-2 border-b md:border-b-0 md:border-r border-gray-800">
            <Text
              level="span"
              className="text-[10px] text-white hover:text-red-500 transition-colors duration-200 cursor-default font-mono block mb-1 uppercase tracking-wider"
            >
              Input
            </Text>
            <div className="font-mono text-xs text-gray-300 bg-black/40 px-2 py-1.5 rounded border border-gray-800/50 overflow-x-auto whitespace-pre">
              {inputText}
            </div>
          </div>
          <div className="flex-1 min-w-0 p-2">
            <Text
              level="span"
              className="text-[10px] text-white hover:text-red-500 transition-colors duration-200 cursor-default font-mono block mb-1 uppercase tracking-wider"
            >
              Output
            </Text>
            <div className="font-mono text-xs text-gray-300 bg-black/40 px-2 py-1.5 rounded border border-gray-800/50 overflow-x-auto whitespace-pre">
              {outputText}
            </div>
          </div>
        </div>

        {explanation && (
          <div className="px-2 py-2 bg-[#111] border-t border-gray-800">
            <Text
              level="span"
              className="text-[10px] text-white hover:text-red-500 transition-colors duration-200 cursor-default font-mono block mb-0.5 uppercase tracking-wider"
            >
              Explanation
            </Text>
            <Text level="p" className="text-sm text-gray-400 leading-relaxed">
              {explanation}
            </Text>
          </div>
        )}
      </div>
      {image && (
        <div className="mt-1.5">
          <img
            src={image}
            alt={`Example ${index + 1}`}
            className="rounded border border-gray-800 max-w-full h-auto"
          />
        </div>
      )}
    </div>
  );
};

export default ExampleCard;
